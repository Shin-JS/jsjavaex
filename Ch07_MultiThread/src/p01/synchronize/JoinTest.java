package p01.synchronize;

import java.util.ArrayList;

/**[스레드]
 * 
 **/
public class JoinTest {
	//
	public static ArrayList<String> carList = new ArrayList<>();
	public static void main(String[] args) {
		Before bf = new Before("bf");
		After at = new After("at");
		After atr = new After("atr");
		Thread th = new Thread(atr);
		try {
			bf.start();
			bf.join(); //호출한 스레드는 일시정지되어 호출한 작업이 완료될때까지 기다림, 정지->실행상태로 돌아가기 위해서는
					   //작업이 완료되거나, 정해진 시간이 지나야 실행상태로 돌아감
			at.start();
			th.start();
		}catch(InterruptedException e) {
	}

	}
}
