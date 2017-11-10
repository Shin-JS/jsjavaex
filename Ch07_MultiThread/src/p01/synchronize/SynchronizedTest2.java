package p01.synchronize;
/**[스레드]
 * synchronize
 **/
public class SynchronizedTest2 extends Thread{
	public static void main(String[] args) {
		//객체 생성
		Account2 myAccount = new Account2();
		
		for(int i = 0; i<10 ;i++) {
			//Thread객체 생성..(10개)
			Thread t = new Thread(new DepositThread2(myAccount)); 
			//Thread 객체의 run()메소드 실행
			t.start();
		}
		
	}
}
