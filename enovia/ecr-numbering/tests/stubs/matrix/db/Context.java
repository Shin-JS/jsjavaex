package matrix.db;

/** Test double only. Never deploy this package. */
public class Context {
    public static final int TRANSACTION_TYPE_UPDATE = 2;
    public int transactionType = TRANSACTION_TYPE_UPDATE;
    public int getTransactionType() { return transactionType; }
}
