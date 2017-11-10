package p01.multithread;
/**[스레드]
 * -.멀티쓰레드 객체를 만드는 방법
 *  1. Thread클래스를 상속받아서 생성
 *  2. Runnable인터페이스를 구현한 구현체를 Thread클래스 생성자의 매개변수로 넘겨서 생성
 * -.멀티쓰레드 실행
 *  .생성된 Thread는 run()메소드가 재정의된 구현체
 *  .실행은 start()메소드로 실행, start()메소드는 Thread의 run()메소드의 실행을 요청
 **/
public class MultiMainThreadExample1 {
	public static void main(String[] args) {
		//
		//MultiSub1 구현객체 생성
		MultiSub1 multi1 = new MultiSub1();
		//MultiSub2 구현객체 생성
		MultiSub2 multi2 = new MultiSub2();
		//Thread 실행: start();
		multi1.start();
		Thread m2 = new Thread(multi2,"multi2");
		m2.start();
		/*for (int i = 0; i < 2000 ; i++) {
			System.out.print("*");
		}
		System.out.println();*/
	}
}
//Thread를 상속받아서 생성
class MultiSub1 extends Thread{ //Thread클래스
	@Override
	public void run() {
		for (int i = 0; i < 2000 ; i++) {
			System.out.print("*");
		}
		System.out.println();
	}
}
//Runnable 구현해서 생성
class MultiSub2 implements Runnable{ //Runnable인터페이스
	@Override
	public void run() {
		for (int i = 0; i < 2000 ; i++) {
			System.out.print("-");
		}
		System.out.println();
		
	}
	
}