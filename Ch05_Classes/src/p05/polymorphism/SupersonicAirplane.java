package p05.polymorphism;
/**[다형성, 상속]
 * -.final 필드: 상수, 수정불가
 **/
public class SupersonicAirplane extends Airplane {
	public static final int NORMAL = 1; //상수 (final 필드 = > 상수)
	public static final int SUPERSONIC = 2; //상수
	//필드
	public int flyMode = NORMAL;
	@Override
	public void fly() { //자식메소드
		if(flyMode==SUPERSONIC) {
			System.out.println("초음속비행");
		}else {
		super.fly(); //자식 클래스에서 부모 메소드 호출: super.메소드();
		}
	}
}
