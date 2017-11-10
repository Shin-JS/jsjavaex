package p01.synchronize;
/**[스레드]
 * synchronize
 **/
public class Account {
	//필드
	long balance;//현재 잔액
	
	public void deposit(long amount) {
		balance += amount;
	}
	
	public void iquiry() {
		System.out.println("잔액: " + balance);
	}
	
}
