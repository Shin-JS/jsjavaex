package p01.synchronize;
/**[스레드]
 * Thread상속 객체
 **/
public class Before extends Thread{
	//생성자
	Before(String str) {
		super(str);
	}
	//메소드
	void addCar() {
		System.out.println("addCar");
		//배열형태의 자료구조에 객체를 저장하는 메소드=> add(객체);, add()는 자료구조의 끝에 append에서 자료를 저장
		JoinTest.carList.add("소나타");
		JoinTest.carList.add("sm5");
		JoinTest.carList.add("그렌저");
		JoinTest.carList.add("카니발");	
	}
	public void run() {
		System.out.println(getName());
		try {
			Thread.sleep(1000);//1초간 thread정지
		}catch(Exception e) {
			
		}
		addCar();
	}
}

class After extends Thread implements Runnable{
	public After(String title) {
		super(title);
	}
	public void run() {
		System.out.println(getName());
		for(String car:JoinTest.carList) {
			System.out.println(car);
		}
	}
}
