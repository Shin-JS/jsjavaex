package p01.multithread;
/**[스레드]
 * 
 **/
public class RunTest {
	public static void main(String[] args) {
		//Runnable로 구현된 객체 생성
		//Thread()생성자의 매개변수로 Thread클래스, 이름을 넘기면 생성되는 Thread는 사용자 정의 이름을 부여받는다
		Thread th1 = new Thread(new B2(),"Thread1");
		Thread th2 = new Thread(new B2(),"Thread2");
		//실행
		th1.start();
		th2.start();
	}
}
/**
 * 자바는 클래스의 다중상속을 허락하지 않음
 * class B2 extends B1, Thread{}←멀티쓰레드를 생성해야 하는 상황에 B2클래스는 B1도 상속을 받아야 하는 상황에서 보조적 수단으로
 * 						         인터페이스로 구현
 * class B2 extends B1 implements Runnable{} → 다중 상속의 효과를 냄
 * 
 **/
class B1{}
class B2 extends B1 implements Runnable{
	@Override
	public void run() {
		for (int i = 0; i <100 ; i++) {
			//현재 실행중인 쓰레드의 정보를 얻어오는 메소드 → currentThread()
			//currentThread().getName() - 실행중인 쓰레드의 이름을 리턴
			System.out.print(Thread.currentThread().getName()+"이 실행중\t");
			if(i%10==0) {
				System.out.println();
			}
		}
	}
	
}
