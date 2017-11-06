package p05.polymorphism.fields;
/** [필드의 다형성]
 * 
 **/
public class HankookTire extends Tire{
	public HankookTire(String location, int maxRotation) {
		super(location, maxRotation);
	}
	//자식클래스에서 메소드 재정의
	@Override
	public boolean roll() {
		++accumulateRotation;
		if(accumulateRotation < maxRotation) {
			System.out.println(location + "HankookTire 남은수명: " + (maxRotation - accumulateRotation));
			return true; //if-else인경우 return true/return false로 둘 중 하나를 선택하는 형식으로 기술할 수 있음
		}else {
			System.out.println("*** " + location + " HankookTire교체 ***");
			return false;
		}
	}
}
