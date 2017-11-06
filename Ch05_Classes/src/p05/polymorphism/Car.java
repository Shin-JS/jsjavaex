package p05.polymorphism;
/** [다형성, 상속]
 * -.final 필드: 상수(재정의 불가)
 * -.final 메소드: 재정의 불가메소드(오버라이드 안됨)
 * -.final 클래스: 상속불가 클래스
 **/
public class Car {
	//필드
	public int speed;
	
	//메소드
	public void speedUp() {
		speed+=1;
	}
	
	//final 메소드
	public final void stop() {
		System.out.println("정지");
		speed = 0;
	}
}
