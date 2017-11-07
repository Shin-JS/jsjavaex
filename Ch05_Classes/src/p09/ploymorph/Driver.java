package p09.ploymorph;
/**[인터페이스]
 * 인터페이스 매개변수의 다형성
 * drive메소드의 매개변수로 인터페이스(Vehicle)이 옴
 **/
public class Driver {
	public void drive(Vehicle vehicle) {
		vehicle.run();
		if (vehicle instanceof Bus) { //casting가능여부를 확인하기 위한 메소드
			((Bus)vehicle).checkFare(); //checkFare메소드를 사용하기 위한 Casting(강제형변환)
		}
	}
}
