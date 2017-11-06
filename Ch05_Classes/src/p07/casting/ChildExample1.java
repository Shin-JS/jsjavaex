package p07.casting;
/** [형변환]
 * 
 **/
public class ChildExample1 {
	public static void main(String[] args) {
		//상속관계에 있는 부모타입의 참조변수에 자식클래스객체를 대입
		Parent parent = new Child();  //Promotion
		parent.field1 = "data1";  //부모타입으로 변경된 후, 부모필드 접근
		parent.method1(); //부모타입으로 변경된 후, 부모필드 접근
		parent.method2(); //부모타입으로 변경된 후, 부모필드 접근
		
//		parent.field2 = "data2"; //부모타입으로 변경된 후, 자식클래스에서 추가된 필드 접근불가.
//		parent.method3();//부모타입으로 변경된 후, 자식클래스에서 추가된 메소드 접근불가
		
		//추가된 자식메소드와 필드를 사용해야하는경우, 
		Child child = (Child)parent;  //Casting
		child.field2 = "yyyy";//자식타입으로 강제 형변환 후, 추가된 자식필드에 접근가능
		child.method3(); //자식클래스에서 추가된 메소드도 접근 가능
	}
}
