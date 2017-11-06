package p07.casting;
/** [형변환]
 * -.자식클래스인 Child에서 추가된 필드와 메소드는 Parent타입으로 형변환되면 사용불가
 **/
public class Child extends Parent{
	//자식클래스에서 추가된 필드
	public String field2;
	//자식클래스에서 추가된 메소드
	public void method3() {
		System.out.println("child-method3()");
	}
}
