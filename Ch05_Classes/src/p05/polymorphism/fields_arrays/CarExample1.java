package p05.polymorphism.fields_arrays;
/** [필드의 다형성]
 * 
 **/
public class CarExample1 {
	public static void main(String[] args) {
		//Car 객체 생성
		Car car = new Car();
		for (int i = 1; i <= 5; i++) {
			int problemLocation = car.run(); 
			if (problemLocation != 0) {
				System.out.println(car.tires[problemLocation-1].location+" HankookTire 교체");
				car.tires[problemLocation-1] = new HankookTire(car.tires[problemLocation-1].location, 15);
			}
			System.out.println("========================================");
		}
	}
}
