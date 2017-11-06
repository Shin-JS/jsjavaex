package p05.polymorphism.fields;
/** [필드의 다형성]
 * 
 **/
public class Car {
	//필드(Car의 부품으로써의 필드)
	Tire frontLeftTire = new Tire("왼쪽 앞",6); 
	Tire frontRightTire = new Tire("오른쪽 앞",	2);
	Tire rearLeftTire = new Tire("왼쪽 뒤", 3);
	Tire rearRightTire = new Tire("오른쪽 뒤", 4);
	
	//메소드
	int run() {
		System.out.println("자동차 달림.");
		if(frontLeftTire.roll()==false) {
			stop();
			return 1;
		}
		if(frontRightTire.roll()==false) {
			stop();
			return 2;
		}
		if(rearLeftTire.roll()==false) {
			stop();
			return 3;
		}
		if(rearRightTire.roll()==false) {
			stop();
			return 4;
		}
		return 0;
	}

	private void stop() {
		System.out.println("자동차 멈춤");
		
	}
	
}
