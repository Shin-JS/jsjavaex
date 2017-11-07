package p09.ploymorph;
/**[인터페이스]
 * 인터페이스 매개변수의 다형성
 **/
public class Bus implements Vehicle {

	@Override
	public void run() {
		System.out.println("Bus가 달립니다.");
	}
	//메소드 추가
	public void checkFare() {
		System.out.println("승차요금을 체크합니다.");
	}
}
