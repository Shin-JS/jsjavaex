package p01.synchronize;
/**[스레드]
 * 
 **/
public class ToiletThread implements Runnable{
	//필드
	TwoToilets twoToilets;
	String user;
	
	//생성자
	
	public ToiletThread(TwoToilets twoToilets, String user) {
		super();
		this.twoToilets = twoToilets;
		this.user = user;
	}
	//메소드
	@Override
	public void run() {
		try {
			twoToilets.use(user);//사용처리 - wait(); --다른 쓰레드 기다림
			Thread.sleep(5000);//5초간 정지
			twoToilets.done(user); //사용완료 - notifyAll(); -- 다른 쓰레드 실행
		}catch(InterruptedException e) {
			System.out.println(e.getMessage());
		}
	}

	
}
