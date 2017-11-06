package p05.polymorphism.fields_arrays;
/** [필드의 다형성]
 * 
 **/
public class Car {
	//필드(Car의 부품으로써의 필드)
	Tire[] tires = {
	new Tire("왼쪽 앞",6), 
	new Tire("오른쪽 앞", 2),
	new Tire("왼쪽 뒤", 3),
	new Tire("오른쪽 뒤", 4),
		};
	
	//메소드
	int run() {
		System.out.println("자동차 달림.");
		for (int i = 0; i < tires.length; i++) {
			if(tires[i].roll()==false) {
				stop();
				return (i+i);
			}
		}
		/*if(frontLeftTire.roll()==false) {
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
		}*/ //배열로 만들어서 사용하기때문에 지금 이 소스파일에서는 필요 없음, p05.polymorphism.fields의 Car.java참고
		return 0;
	}

	private void stop() {
		System.out.println("자동차 멈춤");
		
	}
	
}
