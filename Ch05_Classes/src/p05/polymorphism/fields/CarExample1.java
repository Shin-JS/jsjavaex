package p05.polymorphism.fields;
/** [필드의 다형성]
 * 
 **/
public class CarExample1 {
	public static void main(String[] args) {
		//Car 객체 생성
		Car car = new Car();
		for (int i = 1; i <= 5; i++) {
			int problemLocation = car.run(); 
			switch (problemLocation) {
			case 1:
				System.out.println("왼쪽 앞 HankookTire로 교체");
				car.frontLeftTire = new HankookTire("왼쪽 앞", 15);
				break;
			case 2:
				System.out.println("오른쪽 앞 KumhoTire로 교체");
				car.frontRightTire = new KumhoTire("오른쪽 앞", 13);				
				break;
			case 3:
				System.out.println("왼쪽 뒤 HankookTire로 교체");
				car.rearLeftTire = new HankookTire("왼쪽 뒤", 14);
				break;
			case 4:
				System.out.println("오른쪽 뒤 KumhoTire로 교체");
				car.rearRightTire = new KumhoTire("오른쪽 뒤", 17);	
				break;
			}
			System.out.println("========================================");
		}
	}
}
