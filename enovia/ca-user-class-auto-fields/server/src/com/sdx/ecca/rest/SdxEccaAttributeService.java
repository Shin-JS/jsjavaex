package com.sdx.ecca.rest;

import com.dassault_systemes.basicServicesClasses.MQLServices;
import com.dassault_systemes.platform.restServices.RestService;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonException;
import jakarta.json.JsonObject;
import jakarta.json.JsonString;
import jakarta.json.JsonValue;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import matrix.db.Context;

/** OOTB 수정 없이 별도로 배포하는 읽기 전용 속성 메타데이터 조회 서비스입니다. */
@Path("/attributes")
public class SdxEccaAttributeService extends RestService {
    private static final String TARGET_TYPE = "sdxECChangeAction";
    private static final String INDEXATION = "property[Indexation].value";
    private static final Logger LOG = Logger.getLogger(SdxEccaAttributeService.class.getName());

    @POST
    @Path("/visibility")
    @Consumes("application/json")
    @Produces("application/json")
    public Response readVisibility(
            @jakarta.ws.rs.core.Context HttpServletRequest request,
            List<String> attributeNames) {
        Context userContext = null;
        try {
            // 2025 ENONewServices와 같은 인증 Context 취득 방식입니다.
            // 시스템 사용자로 전환하거나 권한을 올리지 않습니다.
            userContext = getAuthenticatedContext(request, true);
            if (userContext == null) return error(401, "LOGIN_REQUIRED");

            // JSON 배열은 서버의 JSON Provider가 List<String>으로 변환합니다.
            if (attributeNames == null || attributeNames.isEmpty() || attributeNames.size() > 300) {
                return error(400, "INVALID_REQUEST");
            }
            Set<String> names = new LinkedHashSet<String>();
            for (String name : attributeNames) {
                // 패턴 조회를 막고 정확한 속성명만 전달합니다.
                if (name == null || name.trim().isEmpty() || name.length() > 256 ||
                        !name.matches("[\\p{L}\\p{N}_ .:-]+")) {
                    return error(400, "INVALID_REQUEST");
                }
                names.add(name);
            }
            // ENOAttributesCore.getAttributeDescription에서 사용하는 일괄 조회 API입니다.
            // 전체 Dictionary나 객체의 속성값을 조회하지 않습니다.
            Map<String, JsonObject> rows = MQLServices.getPropertiesOfAdminType(
                userContext,
                MQLServices.MQLAdminTypes.TYPE_ATTRIBUTE,
                names,
                Arrays.asList("name", INDEXATION)
            );
            if (rows == null) throw new IllegalStateException("Metadata query failed");
            return Response.ok(makeResponse(names, rows).toString(), "application/json")
                .header("Cache-Control", "no-store")
                .build();
        } catch (WebApplicationException error) {
            return error(error.getResponse().getStatus(), "AUTHENTICATION_FAILED");
        } catch (IllegalArgumentException | JsonException error) {
            return error(400, "INVALID_REQUEST");
        } catch (Exception error) {
            LOG.log(Level.WARNING, "[sdxECCA] Indexation metadata query failed", error);
            return error(500, "METADATA_QUERY_FAILED");
        } finally {
            if (userContext != null) {
                try {
                    userContext.shutdown();
                } catch (Exception error) {
                    LOG.log(Level.WARNING, "[sdxECCA] Context shutdown failed", error);
                }
            }
        }
    }

    static JsonObject makeResponse(Set<String> names, Map<String, JsonObject> rows) {
        JsonArrayBuilder results = Json.createArrayBuilder();
        Set<String> returnedNames = new LinkedHashSet<String>();
        for (JsonObject row : rows.values()) {
            if (row == null) continue;
            String name = singleValue(row.get("name"));
            if (name == null || !names.contains(name) || !returnedNames.add(name)) continue;
            String indexation = singleValue(row.get(INDEXATION));
            if (indexation == null) continue;
            indexation = indexation.trim();
            if (!indexation.isEmpty() && !"TRUE".equals(indexation) && !"FALSE".equals(indexation)) continue;
            results.add(Json.createObjectBuilder()
                .add("name", name)
                .add("searchable", "TRUE".equals(indexation)));
        }
        // 실제 속성명까지 확인된 행의 빈 property만 false입니다.
        // 조회되지 않은 속성은 생략하여 JS가 기존 표시를 유지하게 합니다.
        return Json.createObjectBuilder()
            .add("success", true)
            .add("type", TARGET_TYPE)
            .add("attributes", results)
            .build();
    }

    private static String singleValue(JsonValue value) {
        if (value == null || value == JsonValue.NULL) return "";
        if (value instanceof JsonString) return ((JsonString) value).getString();
        if (value instanceof JsonArray) {
            JsonArray values = (JsonArray) value;
            if (values.isEmpty()) return "";
            if (values.size() == 1) return singleValue(values.get(0));
        }
        return null;
    }

    private static Response error(int status, String message) {
        return Response.status(status)
            .entity(Json.createObjectBuilder().add("success", false).add("error", message).build().toString())
            .type("application/json")
            .header("Cache-Control", "no-store")
            .build();
    }
}
