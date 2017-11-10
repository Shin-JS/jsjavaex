package p01.synchronize;
/**[스레드]
 * Daemon
 * -.주 쓰레드의 보조 역할을 하는 쓰레드, 주 쓰레드가 종료되면 보조쓰레드도 종료됨
 * -.일반스레드를 데몬스레드로 바꾸는 방법: 데몬참조변수.setDaemon(true);
 **/
public class DaemonTestExample1 {
	public static void main(String[] args) {
		//객체 생성
		Daemon daemon = new Daemon();
		//setDaemon(true)
		daemon.setDaemon(true); //일반쓰레드 객체의 데몬쓰레드화
		daemon.start();
		for(int i = 1; i<=5; i++) {
			System.out.println(i);
			try {
				Thread.sleep(3000);
			} catch (InterruptedException e) {
				System.out.println(e.getMessage());
			}
		}
	}
}
