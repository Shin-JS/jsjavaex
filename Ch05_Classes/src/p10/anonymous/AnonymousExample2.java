package p10.anonymous;
/** [무명객체]
 *  무명인터페이스
 **/
public class AnonymousExample2 {
	public static void main(String[] args) {
		//객체 생성
		Anonymous2 anony = new Anonymous2();
		//익명객체 필드 사용
		anony.field.turnOn();
		//익명객체 로컬변수 이용
		anony.method1();
		//익명객체 매개값 사용
		anony.method2(new RemoteControl() { 

			@Override
			public void turnOn() {
				System.out.println("SmartTv를 켭니다.");
			}
			
			@Override
			public void turnOff() {
				System.out.println("SmartTv를 끕니다.");
			}
		});
		//1. 인터페이스 구현체 만들기(구현체 implements 인터페이스)
		//2. 구현체의 메소드 재정의
		//3. 인터페이스타입으로선언하고 구현체를 생성하여 대입 rc = new SmartControl();
		//4. rc는 인터페이스 타입으로 Promotion(자동형변환)
		//5. method2()의 매개변수로 넘김.
		//의 결과
		RemoteControl rc = new SmartControl();
		anony.method2(rc); //가 이거임
		anony.method3(1);
	}
}
