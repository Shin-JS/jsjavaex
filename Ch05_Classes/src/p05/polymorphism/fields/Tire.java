package p05.polymorphism.fields;
/** [필드의 다형성]
 * 
 **/
public class Tire {
	//필드
	public int maxRotation; //타이어의 수명
	public int accumulateRotation; //누적회전수
	public String location; //타이어의 위치
	
	//생성자
	public Tire(String location, int maxRotation) {
		this.location = location; //위치
		this.maxRotation = maxRotation; //최대수명
	}
	
	//메소드
	public boolean roll() {
		++accumulateRotation;//누적회전수 증가
		if (accumulateRotation < maxRotation) {
			System.out.println(location + "Tire의 남은수명" + (maxRotation - accumulateRotation) + "회");
			return true;
		}else {
			System.out.println("*** " + location + " Tire 교체");
			return false;
		}
	}
	
}
