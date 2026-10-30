package com.sdx.ecca.rest;

import com.dassault_systemes.platform.restServices.RestService;
import com.matrixone.apps.domain.DomainObject;
import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import matrix.db.Context;
import matrix.util.StringList;

/** 선택 객체의 기본 정보와 전체 객체 속성값을 현재 사용자 권한으로 조회합니다. */
@Path("/models")
public class SdxEccaModelService extends RestService {
    private static final String MODEL_TYPE = "sdxMTopAssy";
    private static final Logger LOG = Logger.getLogger(SdxEccaModelService.class.getName());

    @GET
    @Path("/{objectId}/attributes")
    @Produces("application/json")
    public Response readAttributes(
            @jakarta.ws.rs.core.Context HttpServletRequest request,
            @PathParam("objectId") String objectId) {
        Context userContext = null;
        try {
            userContext = getAuthenticatedContext(request, true);
            if (userContext == null) return error(401, "LOGIN_REQUIRED");
            if (objectId == null || !objectId.matches("[A-Za-z0-9.-]{1,128}")) {
                return error(400, "INVALID_OBJECT_ID");
            }
            DomainObject object = DomainObject.newInstance(userContext, objectId);
            StringList selects = new StringList();
            selects.add("id");
            selects.add("physicalid");
            selects.add("type");
            selects.add("name");
            selects.add("current.access[read]");
            Map info = object.getInfo(userContext, selects);
            if (!"true".equalsIgnoreCase(String.valueOf(info.get("current.access[read]")))) {
                return error(403, "OBJECT_READ_DENIED");
            }
            if (!MODEL_TYPE.equals(info.get("type"))) return error(400, "INVALID_MODEL_TYPE");

            // 상속/부착 interface를 포함한 이 객체의 속성값을 읽습니다. 관계 속성은 제외합니다.
            Map attributes = object.getAttributeMap(userContext);
            JsonObjectBuilder values = Json.createObjectBuilder();
            for (Object key : attributes.keySet()) {
                Object value = attributes.get(key);
                if (value instanceof Iterable) {
                    jakarta.json.JsonArrayBuilder items = Json.createArrayBuilder();
                    for (Object item : (Iterable<?>) value) items.add(item == null ? "" : item.toString());
                    values.add(key.toString(), items);
                } else {
                    values.add(key.toString(), value == null ? "" : value.toString());
                }
            }
            return Response.ok(Json.createObjectBuilder()
                .add("success", true)
                .add("id", String.valueOf(info.get("id")))
                .add("physicalid", String.valueOf(info.get("physicalid")))
                .add("type", MODEL_TYPE)
                .add("name", String.valueOf(info.get("name")))
                .add("attributes", values)
                .build().toString(), "application/json")
                .header("Cache-Control", "no-store").build();
        } catch (WebApplicationException error) {
            return error(error.getResponse().getStatus(), "AUTHENTICATION_FAILED");
        } catch (Exception error) {
            LOG.log(Level.WARNING, "[sdxECCA] Model attribute query failed", error);
            return error(500, "MODEL_ATTRIBUTE_QUERY_FAILED");
        } finally {
            if (userContext != null) {
                try { userContext.shutdown(); }
                catch (Exception error) { LOG.log(Level.WARNING, "[sdxECCA] Context shutdown failed", error); }
            }
        }
    }

    private static Response error(int status, String message) {
        return Response.status(status)
            .entity(Json.createObjectBuilder().add("success", false).add("error", message).build().toString())
            .type("application/json").header("Cache-Control", "no-store").build();
    }
}
