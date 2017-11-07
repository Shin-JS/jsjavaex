package p09.ploymorph;
/**[인터페이스의 다형성]
 * 
 **/
public class CarExample1 {
	public static void main(String[] args) {
		//객체 생성
		Car myCar = new Car();
		myCar.run();
		
		//myCar의 필드는 Tire타입의 인터페이스, 구현체를 대입
		myCar.frontLeftTire = new KumhoTire(); //Tire 교체
		myCar.frontRightTire = new KumhoTire(); //Tire 교체
		myCar.run();
	}
}
