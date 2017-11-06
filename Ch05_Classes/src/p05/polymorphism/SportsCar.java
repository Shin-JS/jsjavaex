package p05.polymorphism;
/** [다형성, 상속]
 * -.상속: 상속클래스명 extends 부모클래스
 **/
public class SportsCar extends Car {
	@Override //컴파일러에게 재정의되었음을 알려주는 기능 (여기서는 주석의 기능)
	public void speedUp() {
//		super.speedUp(); //부모클래스의 메소드를 사용: super.메소드()
		speed += 10; //부모메소드에서 1씩 증가하는 메소드를 자식메소드에서 10씩 증가하도록 재정의
	}
	/* 부모클래스에서 final로 지정된 메소드이므로 자식클래스에서 재정의 불가능
	private void stop() {
		System.out.println("자식메소드에서 재정의");
		speed = 0;
	}*/
}
