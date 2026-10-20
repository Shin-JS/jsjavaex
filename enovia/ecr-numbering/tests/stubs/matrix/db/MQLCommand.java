package matrix.db;

import java.util.ArrayList;
import java.util.List;

/** Call-order/output double only; does not execute MQL or simulate DB transactions. */
public class MQLCommand {
    public static String result = "";
    public static String error = "";
    public static boolean success = true;
    public static String lastCommand;
    public static List<String> lastArguments;
    public static String exec(Context context, String command, List<String> arguments) throws Exception {
        lastCommand = command;
        lastArguments = new ArrayList<>(arguments);
        BusinessObject.calls.add("query:" + arguments.get(1));
        if (!success || !error.isEmpty()) throw new Exception("simulated MQL error: " + error);
        return result;
    }
}
