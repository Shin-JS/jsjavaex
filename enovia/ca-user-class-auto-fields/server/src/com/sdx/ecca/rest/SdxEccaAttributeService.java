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
    // 사용자 데이터 모델의 실제 철자(Atrribute)를 그대로 사용합니다.
    private static final String CONTROL_TYPE = "sdxECAtrributeControl";
    private static final String ORGANIZATION = "MX";
    private static final String STATE = "CREATE";
    private static final String[] FIELDS = {
        "sdxECAttributeName", "sdxECAttributeOrder", "sdxECAttributeOrganization",
        "sdxECAttributeState", "sdxECAttributeRead", "sdxECAttributeEdit",
        "sdxECAttributeMandatory", "sdxECAttributeMandatoryCheck"
    };
    private static final Logger LOG = Logger.getLogger(SdxEccaAttributeService.class.getName());

    @GET
    @Path("/control")
    @Produces("application/json")
    public Response readControl(@jakarta.ws.rs.core.Context HttpServletRequest request) {
        Context context = null;
        try {
            context = getAuthenticatedContext(request, true);
            if (context == null) return error(401, "LOGIN_REQUIRED");
            StringList selects = new StringList();
            for (String field : FIELDS) selects.add("attribute[" + field + "]");
            // DB 조회 단계부터 조건을 제한합니다. 다른 사업부/상태의 규칙은 읽지 않습니다.
            String where = "attribute[sdxECAttributeOrganization] == 'MX' && " +
                "attribute[sdxECAttributeState] == 'CREATE'";
            List rows = DomainObject.findObjects(context, CONTROL_TYPE, "*", "*", "*", "*",
                where, false, selects);
            if (rows == null) throw new IllegalStateException("Control query returned null");
            return Response.ok(makeResponse(rows).toString(), "application/json")
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

    static JsonObject makeResponse(List rows) {
        if (rows.size() > 1000) throw new IllegalArgumentException("Too many attribute controls");
        List<JsonObject> rules = new ArrayList<JsonObject>();
        Set<String> names = new HashSet<String>();
        for (Object item : rows) {
            if (!(item instanceof Map)) throw new IllegalArgumentException("Invalid control row");
            Map row = (Map) item;
            if (!ORGANIZATION.equals(value(row, FIELDS[2])) || !STATE.equals(value(row, FIELDS[3]))) {
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
            .add("organization", ORGANIZATION).add("state", STATE).add("attributes", attributes).build();
    }

    private static String value(Map row, String name) {
        Object value = row.get("attribute[" + name + "]");
        if (!(value instanceof String)) throw new IllegalArgumentException("Missing or non-scalar control: " + name);
        return ((String) value).trim();
    }

    private static boolean flag(Map row, String name) {
        String value = value(row, name);
        if (!"Y".equals(value) && !"N".equals(value)) throw new IllegalArgumentException("Expected Y/N: " + name);
        return "Y".equals(value);
    }

    private static Response error(int status, String message) {
        return Response.status(status).entity(Json.createObjectBuilder().add("success", false)
            .add("error", message).build().toString()).type("application/json")
            .header("Cache-Control", "no-store").build();
    }
}
