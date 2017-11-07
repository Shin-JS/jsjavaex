package p09.ploymorph;
/**[인터페이스의 다형성]
 *  -.인터페이스의 필드의 다형성
 **/
public class CarExample2 {
	public static void main(String[] args) {
		//객체생성
		Car2 myCar = new Car2();
		myCar.run();
		
		myCar.tires[0] = new KumhoTire();
		myCar.tires[1] = new KumhoTire();
		myCar.tires[2] = new KumhoTire();
		myCar.tires[3] = new KumhoTire();
		
		myCar.run();
	}
}
