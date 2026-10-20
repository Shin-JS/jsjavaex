package matrix.db;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Test double only; no Matrix DB locking/rollback simulation. */
public class BusinessObject {
    public static final Map<String, String> values = new HashMap<>();
    public static final List<String> calls = new ArrayList<>();
    public static boolean failWrite;
    private final String id;
    public BusinessObject(String id) { this.id = id; }
    public void lockForUpdate(Context context) { calls.add("lock:" + id); }
    public Attribute getAttributeValues(Context context, String attribute) {
        calls.add("read:" + id); return new Attribute(values.get(id));
    }
    public void setAttributeValue(Context context, String attribute, String value) throws Exception {
        calls.add("write:" + id);
        if (failWrite) throw new Exception("simulated storage failure");
        values.put(id, value);
    }
}
