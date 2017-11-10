package p01.synchronize;
/**[스레드]
 * 한정된 자원을 사용하는 여러개의 스레드들의 동기화방법: 
 * -.wait(),notifyAll()을 이용하여 스레드들끼리 신호를 주고 받아서 처리,
 *   작업의 우선순위는 jvm의 작업스케줄의 우선순위에 의해 정해짐
 **/
public class ToiletUserExample {
	public static void main(String[] args) {
		//멀티쓰레드 객체 생성
		TwoToilets twoToilets = new TwoToilets();
		for(int i = 0; i <= 10; i++) {
			//스레드 객체 생성
			Thread t = new Thread(new ToiletThread(twoToilets,"사용자"+i));
			//스레드 실행
			t.start();
		}
	}
}
