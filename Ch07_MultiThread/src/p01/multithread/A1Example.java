package p01.multithread;
/**[스레드]
 * -.MultiThread객체 Thread
 **/
public class A1Example {
	public static void main(String[] args) {
		A1 a1 = new A1("subA");//Thread객체 생성 -subA
		A1 a2 = new A1("subB"); //Thread 객체 생성-subB
		a1.start(); //Thread의 run()메소드 실행을 요청하는 메소드: start();
		a2.start();//Thread의 run()메소드 실행을 요청하는 메소드: start();
		for(int i = 0; i <= 100; i++) {
			System.out.print("main"+i+"\t"); //getName() 현재 실행중인 thread의 이름을 리턴해주는 메소드
			if(i%10==0) {
				System.out.println();
			}
			try {
				Thread.sleep(100); //0.1초간 일시정지
			}catch(Exception e) {
				System.out.println(e.getMessage());
			}
		}
	}
}
