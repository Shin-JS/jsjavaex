package p06.promotion;
/**[다형성, 상속, ]
 *
 **/
public class ChildPromotionExample {
	public static void main(String[] args) {
		Child child = new Child();
		Parent parent = child; //부모참조변수에 자식객체를 대입, 부모타입으로 promotion(자동형변환)됨
		
		//부모타입으로 변했기 때문에 부모타입의 메소드만 사용가능
		parent.method1();
		parent.method2(); //자식클래스에서 재정의된 메소드는 부모클래스로 변환되더라도 자식의 메소드내용이 출력됨
//		parent.method3(); //부모클래스에 존재하지 않는 메소드이므로 사용불가
	}
}
