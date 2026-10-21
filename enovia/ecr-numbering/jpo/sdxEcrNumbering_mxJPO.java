import matrix.db.Context;
import com.sdx.enovia.ecr.SdxEcrCreateAction;

/** Register createAction through emxTriggerManager; Execute Deferred must be off. */
public class sdxEcrNumbering_mxJPO {
    public sdxEcrNumbering_mxJPO(Context context, String[] args) { }

    public int createAction(Context context, String[] args) throws Exception {
        return SdxEcrCreateAction.execute(context, args);
    }
}
