package p05.polymorphism.params;
/** [parameter의 다형성]
 * -.상속관계에서 부모객체에서 선언된 메소드가 자식객체에서 재정의되면 무조건 자식메소드가 호출됨 (부모타입으로 바뀌어도 자식메소드가 호출)
 * -.매개변수의 다형성: 메소드의 매개변수로 최상위객체를 선언하면, 상속받은 하위의 객체들이 매개변수로 대입가능
 **/
public class DriverExample1 {
	public static void main(String[] args) {
		//객체생성
		Driver driver = new Driver();
		
		//Vehicle을 상속받은 자식객체
		Bus bus = new Bus();
		Taxi taxi = new Taxi();
		
		driver.drive(bus); //매개변수로 Vehicle객체 대신에 Bus객체를 대입
		driver.drive(taxi); //매개변수로 Vehicle객체 대신에 Taxi객체를 대입
//		driver.drive(vehicle);
	}
}
