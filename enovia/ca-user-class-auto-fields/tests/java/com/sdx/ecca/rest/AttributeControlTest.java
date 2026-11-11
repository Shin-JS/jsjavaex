package com.sdx.ecca.rest;

import com.dassault_systemes.platform.restServices.RestService;
import com.matrixone.apps.domain.DomainObject;
import jakarta.json.*;
import jakarta.ws.rs.core.Response;
import java.io.StringReader;
import java.util.*;
import matrix.db.Context;

/** 서비스/JSON은 실제 코드, 인증 Context와 DomainObject만 DB 대역입니다. */
public class AttributeControlTest {
    private static void check(boolean value, String message) {
        if (!value) throw new AssertionError(message);
    }
    private static Map row(String name, String order) {
        Map<String, String> row = new HashMap<>();
        String[] names={"Name","Order","Organization","State","Read","Edit","Mandatory","MandatoryCheck"};
        String[] values={name,order,"MX","CREATE","Y","N","Y","N"};
        for (int i=0;i<names.length;i++) row.put("attribute[sdxECAttribute"+names[i]+"]",values[i]);
        return row;
    }
    private static Response call() {
        RestService.nextContext=new Context();RestService.deny=false;
        Response result=new SdxEccaAttributeService().readControl(null,"CREATE",null);
        check(RestService.nextContext.shutdowns==1,"Context cleanup");
        return result;
    }
    private static JsonObject json(Response result) {
        return Json.createReader(new StringReader((String)result.getEntity())).readObject();
    }
    public static void main(String[] args) {
        java.util.logging.Logger.getLogger(SdxEccaAttributeService.class.getName()).setLevel(java.util.logging.Level.OFF);
        DomainObject.rows=Arrays.asList(row("B","20"),row("A","1"),row("C","20"));
        Response result=call();check(result.getStatus()==200,"Successful query");
        check("sdxECAttributeControl".equals(DomainObject.type),"Exact user type spelling");
        check(DomainObject.where.equals("attribute[sdxECAttributeOrganization] == 'MX' && attribute[sdxECAttributeState] == 'CREATE'"),"DB-scoped MX/CREATE");
        check(DomainObject.selects.size()==8,"Only eight needed selects");
        check(DomainObject.queriedContext==RestService.nextContext,"Current authenticated user only");
        JsonArray rows=json(result).getJsonArray("attributes");
        check(rows.getJsonObject(0).getString("name").equals("A"),"Numeric ordering");
        check(rows.getJsonObject(1).getString("name").equals("B"),"Deterministic order ties");
        JsonObject a=rows.getJsonObject(0);
        check(a.getBoolean("read")&&!a.getBoolean("edit")&&a.getBoolean("mandatory")&&!a.getBoolean("mandatoryCheck"),"Independent Y/N flags");
        for (String key : Arrays.asList("Read","Edit","Mandatory","MandatoryCheck")) {
            Map bad=row("A","1");bad.put("attribute[sdxECAttribute"+key+"]","Z");
            DomainObject.rows=Arrays.asList(bad);check(call().getStatus()==409,"Invalid flag rejected");
        }
        String[] flagNames={"Read","Edit","Mandatory","MandatoryCheck"};
        String[] responseNames={"read","edit","mandatory","mandatoryCheck"};
        for (int i=0;i<flagNames.length;i++) {
            Map n=row("A","1"),x=row("A","1");
            n.put("attribute[sdxECAttribute"+flagNames[i]+"]","N");
            x.put("attribute[sdxECAttribute"+flagNames[i]+"]","X");
            DomainObject.rows=Arrays.asList(n);JsonObject normal=json(call());
            DomainObject.rows=Arrays.asList(x);Response xResult=call();
            check(xResult.getStatus()==200,"X must be accepted: "+flagNames[i]);
            check(json(xResult).equals(normal),"X and N responses must be identical: "+flagNames[i]);
            check(!json(xResult).getJsonArray("attributes").getJsonObject(0).getBoolean(responseNames[i]),"X is false");
        }
        Map allX=row("A","1");
        for (String flag : flagNames) allX.put("attribute[sdxECAttribute"+flag+"]","X");
        DomainObject.rows=Arrays.asList(allX);check(call().getStatus()==200,"All four X flags accepted");
        for (String order : Arrays.asList("","-1","1.5","1000000000")) {
            DomainObject.rows=Arrays.asList(row("A",order));check(call().getStatus()==409,"Invalid order rejected");
        }
        DomainObject.rows=Arrays.asList(row("A","1"),row("A","2"));check(call().getStatus()==409,"Duplicate attribute rejected");
        Map wrong=row("A","1");wrong.put("attribute[sdxECAttributeOrganization]","VD");
        DomainObject.rows=Arrays.asList(wrong);check(call().getStatus()==409,"Cross-scope result rejected");
        DomainObject.rows=Collections.emptyList();check(json(call()).getJsonArray("attributes").isEmpty(),"Empty allowlist is valid");
        Map work=row("A","1");work.put("attribute[sdxECAttributeState]","In Work");
        DomainObject.rows=Arrays.asList(work);
        RestService.nextContext=new Context();RestService.deny=false;
        result=new SdxEccaAttributeService().readControl(null,"In Work",null);
        check(result.getStatus()==200 && json(result).getString("state").equals("In Work"),"Dynamic state response");
        check(DomainObject.where.endsWith("== 'In Work'"),"Dynamic state DB filter");
        DomainObject.rows=Arrays.asList(row("A","1"));
        for (String policy : Arrays.asList("sdxECR", "sdxECO", "customECR")) {
            result=new SdxEccaAttributeService().readControl(null,"CREATE",policy);
            check(result.getStatus()==200,"Policy-filtered query succeeds");
            check(DomainObject.where.endsWith("attribute[sdxECAttributeType] == '"+
                policy.substring(policy.length()-3)+"'"),"Policy suffix filters DB query");
            check(DomainObject.selects.size()==8,"Policy filter needs no additional selects");
        }
        int policyCalls=DomainObject.calls;
        for (String invalid : Arrays.asList("", "EC", "sdxECR' || true", "sdxECR ")) {
            check(new SdxEccaAttributeService().readControl(null,"CREATE",invalid).getStatus()==400,
                "Invalid policy rejected");
        }
        check(DomainObject.calls==policyCalls,"Invalid policy never reaches DB");
        int calls=DomainObject.calls;
        for (String invalid : Arrays.asList(null,""," ","CREATE' || true","*","A\\B")) {
            RestService.nextContext=new Context();
            check(new SdxEccaAttributeService().readControl(null,invalid,null).getStatus()==400,"Invalid state rejected");
            check(RestService.nextContext.shutdowns==1,"Invalid-state Context cleanup");
        }
        check(DomainObject.calls==calls,"Invalid state never reaches DB");
        DomainObject.fail=true;check(call().getStatus()==500,"Query failure");DomainObject.fail=false;
        RestService.deny=true;check(new SdxEccaAttributeService().readControl(null,"CREATE",null).getStatus()==401,"Authentication required");
        check(new SdxEccaModeler().getServices()[0]==SdxEccaAttributeService.class,"Service registration retained");
        System.out.println("PASS: Java service, scoped single query, current-user context, eight selects, deterministic ordering, Y/N/X (N=X), invalid/duplicate/scope/failure/authentication and cleanup");
    }
}
