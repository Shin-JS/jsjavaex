package com.sdx.ecca.rest;

import com.dassault_systemes.platform.restServices.RestService;
import com.matrixone.apps.domain.DomainObject;
import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import matrix.db.Context;
import matrix.util.StringList;

/** CA 등록창의 제어 객체만 현재 사용자 권한으로 조회합니다. Searchable은 사용하지 않습니다. */
@Path("/attributes")
public class SdxEccaAttributeService extends RestService {
    // 등록창 속성 제어 기준정보 타입입니다.
    private static final String CONTROL_TYPE = "sdxECAttributeControl";
    private static final String ORGANIZATION = "MX";
    private static final String[] FIELDS = {
        "sdxECAttributeName", "sdxECAttributeOrder", "sdxECAttributeOrganization",
        "sdxECAttributeState", "sdxECAttributeRead", "sdxECAttributeEdit",
        "sdxECAttributeMandatory", "sdxECAttributeMandatoryCheck"
    };
    private static final Logger LOG = Logger.getLogger(SdxEccaAttributeService.class.getName());

    @GET
    @Path("/control")
    @Produces("application/json")
    public Response readControl(@jakarta.ws.rs.core.Context HttpServletRequest request,
            @QueryParam("state") String state) {
        Context context = null;
        try {
            context = getAuthenticatedContext(request, true);
            if (context == null) return error(401, "LOGIN_REQUIRED");
            // MQL where에 보간하기 전에 따옴표/역슬래시/연산자를 허용하지 않는 상태명만 받습니다.
            if (state == null || !state.matches("[\\p{L}\\p{N}_ .:-]{1,128}") ||
                    !state.equals(state.trim())) return error(400, "INVALID_STATE");
            StringList selects = new StringList();
            for (String field : FIELDS) selects.add("attribute[" + field + "]");
            // DB 조회 단계부터 조건을 제한합니다. 다른 사업부/상태의 규칙은 읽지 않습니다.
            String where = "attribute[sdxECAttributeOrganization] == 'MX' && " +
                "attribute[sdxECAttributeState] == '" + state + "'";
            List rows = DomainObject.findObjects(context, CONTROL_TYPE, "*", "*", "*", "*",
                where, false, selects);
            if (rows == null) throw new IllegalStateException("Control query returned null");
            return Response.ok(makeResponse(rows, state).toString(), "application/json")
                .header("Cache-Control", "no-store").build();
        } catch (WebApplicationException exception) {
            return error(exception.getResponse().getStatus(), "AUTHENTICATION_FAILED");
        } catch (IllegalArgumentException exception) {
            LOG.log(Level.WARNING, "[sdxECCA] Invalid attribute control configuration", exception);
            return error(409, "INVALID_ATTRIBUTE_CONTROL");
        } catch (Exception exception) {
            LOG.log(Level.WARNING, "[sdxECCA] Attribute control query failed", exception);
            return error(500, "ATTRIBUTE_CONTROL_QUERY_FAILED");
        } finally {
            if (context != null) {
                try { context.shutdown(); }
                catch (Exception exception) { LOG.log(Level.WARNING, "[sdxECCA] Context shutdown failed", exception); }
            }
        }
    }

    static JsonObject makeResponse(List rows, String state) {
        if (rows.size() > 1000) throw new IllegalArgumentException("Too many attribute controls");
        List<JsonObject> rules = new ArrayList<JsonObject>();
        Set<String> names = new HashSet<String>();
        for (Object item : rows) {
            if (!(item instanceof Map)) throw new IllegalArgumentException("Invalid control row");
            Map row = (Map) item;
            if (!ORGANIZATION.equals(value(row, FIELDS[2])) || !state.equals(value(row, FIELDS[3]))) {
                throw new IllegalArgumentException("Unexpected control scope");
            }
            String name = value(row, FIELDS[0]);
            if (name.isEmpty() || !names.add(name)) throw new IllegalArgumentException("Empty or duplicate attribute name");
            String order = value(row, FIELDS[1]);
            if (!order.matches("[0-9]{1,9}")) throw new IllegalArgumentException("Invalid attribute order: " + name);
            rules.add(Json.createObjectBuilder().add("name", name).add("order", Integer.parseInt(order))
                .add("read", flag(row, FIELDS[4])).add("edit", flag(row, FIELDS[5]))
                .add("mandatory", flag(row, FIELDS[6])).add("mandatoryCheck", flag(row, FIELDS[7])).build());
        }
        rules.sort(Comparator.comparingInt((JsonObject rule) -> rule.getInt("order"))
            .thenComparing(rule -> rule.getString("name")));
        JsonArrayBuilder attributes = Json.createArrayBuilder();
        for (JsonObject rule : rules) attributes.add(rule);
        return Json.createObjectBuilder().add("success", true).add("type", "sdxECChangeAction")
            .add("organization", ORGANIZATION).add("state", state).add("attributes", attributes).build();
    }

    private static String value(Map row, String name) {
        Object value = row.get("attribute[" + name + "]");
        if (!(value instanceof String)) throw new IllegalArgumentException("Missing or non-scalar control: " + name);
        return ((String) value).trim();
    }

    private static boolean flag(Map row, String name) {
        String value = value(row, name);
        // X는 N과 동일하게 false로 내려 UI/분류의 기존 boolean 처리를 사용합니다.
        if (!"Y".equals(value) && !"N".equals(value) && !"X".equals(value)) {
            throw new IllegalArgumentException("Expected Y/N/X: " + name);
        }
        return "Y".equals(value);
    }

    private static Response error(int status, String message) {
        return Response.status(status).entity(Json.createObjectBuilder().add("success", false)
            .add("error", message).build().toString()).type("application/json")
            .header("Cache-Control", "no-store").build();
    }
}
