package p01.synchronize;
/**[스레드]
 * synchronize
 * -.동기화블럭: 동시에 접근하는 공유영역부분을 동기화시킴
 *  synchronized(공유영역){실행부}
 **/
public class DepositThread3 implements Runnable {
	//필드
	//공유영역
	Account myAccount;
	//생성자
	DepositThread3(Account myAccount){
		this.myAccount = myAccount;
	}
	//메소드
	@Override
	public void run() {
		synchronized(myAccount) {
			for (int i = 0; i < 1000; i++) {
				myAccount.deposit(1);
			}
			myAccount.iquiry();
		}
	}

}
