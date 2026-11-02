package com.matrixone.apps.domain;
import java.util.*;
import matrix.db.Context;
import matrix.util.StringList;
/** 테스트 전용 인증/DB 대역입니다. 배포하지 않습니다. */
public class DomainObject {
    public static List rows = new ArrayList();
    public static boolean fail;
    public static String type, where, vault;
    public static StringList selects;
    public static Context queriedContext;
    public static int calls;
    public static List findObjects(Context context, String typePattern, String name, String rev,
            String owner, String vaultPattern, String expression, boolean expandType, StringList selected) throws Exception {
        calls++; queriedContext=context; type=typePattern; where=expression; vault=vaultPattern; selects=selected;
        if (fail) throw new Exception("test query failed");
        if (expandType) throw new AssertionError("Query must use exact control type");
        return rows;
    }
    public static DomainObject newInstance(Context context, String id) { return new DomainObject(); }
    public Map getInfo(Context context, StringList fields) { return new HashMap(); }
    public Map getAttributeMap(Context context) { return new HashMap(); }
}
