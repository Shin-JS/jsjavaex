package com.matrixone.apps.domain;

import matrix.db.Context;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Call-order/storage double. Does NOT simulate Matrix DB transactions or locks. */
public class DomainObject {
    public static final Map<String, String> values = new HashMap<>();
    public static final List<String> calls = new ArrayList<>();
    public static boolean failWrite;
    public interface NameHandler { void setName(Context context, String id, String name) throws Exception; }
    public static NameHandler nameHandler;
    private final String id;
    public DomainObject(String id) { this.id = id; }
    public static DomainObject newInstance(Context context, String id) { return new DomainObject(id); }
    public void setName(Context context, String name) throws Exception {
        if (nameHandler == null) throw new IllegalStateException("Missing test name handler");
        nameHandler.setName(context, id, name);
    }
    public void lockForUpdate(Context context) { calls.add("lock:" + id); }
    public String getAttributeValue(Context context, String attribute) {
        calls.add("read:" + id); return values.get(id);
    }
    public void setAttributeValue(Context context, String attribute, String value) throws Exception {
        calls.add("write:" + id);
        if (failWrite) throw new Exception("simulated storage failure");
        values.put(id, value);
    }
}
