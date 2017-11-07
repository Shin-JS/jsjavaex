package p09.ploymorph;
/**[인터페이스의 다형성]
 * 
 **/
public class Car {
	//필드
	Tire frontLeftTire = new HankookTire();
	Tire frontRightTire = new HankookTire();
	Tire rearLeftTire = new HankookTire();
	Tire rearRightTire = new HankookTire();
	
	void run() {
		frontLeftTire.roll();
		frontRightTire.roll();
		rearLeftTire.roll();
		rearRightTire.roll();
	}
}
