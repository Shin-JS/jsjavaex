package p05.polymorphism;

public class SupersonicAirplaneExample1 {
	public static void main(String[] args) {
		SupersonicAirplane sa = new SupersonicAirplane();
		sa.takeOff(); //이륙 메소드 호출
		sa.fly(); //비행 메소드 호출
		sa.flyMode = SupersonicAirplane.SUPERSONIC;
		sa.fly(); //flyMode의 값에 SUPERSONIC의 값이 대입되었으므로 자식메소드만 호출
		sa.flyMode = SupersonicAirplane.NORMAL;
		sa.fly(); //flyMode의 값에 NORMAL의 값이 대입되었으므로 부모메소드(super.fly())가 호출됨
		sa.land(); //부모메소드(자식메소드에서 재정의되지 않았음)
	}
}
