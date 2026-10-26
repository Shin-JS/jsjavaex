package com.dassault_systemes.basicServicesClasses;
import java.util.*;
import jakarta.json.JsonObject;
import matrix.db.Context;
public class MQLServices {
    public enum MQLAdminTypes { TYPE_ATTRIBUTE }
    public static Map<String, JsonObject> rows;
    public static int calls;
    public static boolean fail;
    public static Collection<String> requested, selected;
    public static Map<String, JsonObject> getPropertiesOfAdminType(
            Context context, MQLAdminTypes type, Collection<String> names,
            Collection<String> selects) throws Exception {
        calls++;requested=names;selected=selects;
        if (fail) throw new Exception("test metadata failure");
        return rows;
    }
}
