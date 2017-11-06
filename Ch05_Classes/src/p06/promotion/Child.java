package p06.promotion;
/**[다형성, 상속, ]
 * -.부모-자식클래스 상속관계에서 자식클래스에서 재정의된 메소드는 부모클래스에서도 자식메소드가 사용됨
 *   자식 클래스에서 추가된 메소드는 부모클래스로 promotion되면 사용불가 
 **/
public class Child extends Parent {
	@Override
	public void method2() {
		System.out.println("Child-method2()");
	}
	//메소드 추가
	public void method3() {
		System.out.println("Child-method3()");
	}
}
