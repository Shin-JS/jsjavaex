package com.sdx.ecca.rest;

import com.dassault_systemes.basicServicesClasses.MQLServices;
import com.dassault_systemes.platform.restServices.RestService;
import jakarta.json.*;
import jakarta.ws.rs.core.Response;
import java.io.StringReader;
import java.util.*;
import matrix.db.Context;

/** 플랫폼 인증/DB는 대역이며 JSON 파싱과 서비스 코드는 실제 구현을 실행합니다. */
public class AttributeVisibilityTest {
    private static void check(boolean value, String message) {
        if (!value) throw new AssertionError(message);
    }
    private static JsonObject row(String name, String value) {
        JsonObjectBuilder builder=Json.createObjectBuilder().add("name",name);
        if (value!=null) builder.add("property[Indexation].value",value);
        return builder.build();
    }
    private static Response call(String body) {
        RestService.nextContext=new Context();RestService.deny=false;
        Response response=new SdxEccaAttributeService().readVisibility(null,body);
        check(RestService.nextContext.shutdowns==1,"Context must be released");
        return response;
    }
    public static void main(String[] args) {
        String body="{\"type\":\"sdxECChangeAction\",\"attributes\":[\"A\",\"B\",\"C\",\"D\",\"Missing\",\"A\"]}";
        MQLServices.rows=new LinkedHashMap<>();
        MQLServices.rows.put("A",row("A","TRUE"));
        MQLServices.rows.put("B",row("B",""));
        MQLServices.rows.put("C",row("C",null));
        MQLServices.rows.put("D",row("D","unsupported"));
        MQLServices.rows.put("other",row("Other",""));
        Response response=call(body);
        check(response.getStatus()==200,"Successful batch");
        JsonObject result=Json.createReader(new StringReader((String)response.getEntity())).readObject();
        JsonArray values=result.getJsonArray("attributes");
        check(values.size()==3,"Missing/unexpected metadata omitted");
        check(values.getJsonObject(0).getBoolean("searchable"),"TRUE means searchable");
        check(!values.getJsonObject(1).getBoolean("searchable"),"Empty property means false");
        check(!values.getJsonObject(2).getBoolean("searchable"),"Absent property on confirmed row means false");
        check(MQLServices.calls==1,"One batch helper invocation");
        check(MQLServices.requested.size()==5,"Duplicate request names removed");
        check(MQLServices.selected.equals(Arrays.asList("name","property[Indexation].value")),"Minimal selects");
        for (String invalid:Arrays.asList("{}","not-json",
                "{\"type\":\"Change Action\",\"attributes\":[\"A\"]}",
                "{\"type\":true,\"attributes\":[\"A\"]}",
                "{\"type\":\"sdxECChangeAction\",\"attributes\":[\"*\"]}",
                "{\"type\":\"sdxECChangeAction\",\"attributes\":[]}")) {
            check(call(invalid).getStatus()==400,"Invalid request rejected");
        }
        check(MQLServices.calls==1,"Invalid requests must not query metadata");
        MQLServices.fail=true;
        check(call(body).getStatus()==500,"Metadata failure returns no false hide list");
        MQLServices.fail=false;RestService.deny=true;
        check(new SdxEccaAttributeService().readVisibility(null,body).getStatus()==401,"Authentication required");
        check(new SdxEccaModeler().getServices()[0]==SdxEccaAttributeService.class,"Service registration");
        System.out.println("PASS: actual Java JSON/service flow, input rejection, one batch call, TRUE/empty/missing distinction, authentication/error response, Context cleanup");
    }
}
