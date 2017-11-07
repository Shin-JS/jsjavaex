package p09.ploymorph;
/**[인터페이스]
 * 인터페이스 매개변수의 다형성
 **/
public class Taxi implements Vehicle {

	@Override
	public void run() {
		System.out.println(this.getClass().getSimpleName()+"가 달립니다.");
	}

}
