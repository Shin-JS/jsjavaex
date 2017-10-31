package referenceType;
//생성자 = 인스턴스가 생성될때 어떤일을 하는지 결정
/*생성자를 안만들어도 기본적으로 파라미터가 없는 생성자가 있다고 생각, 단
 * 파라미터를 받는 생성자가 있을때는 필요(?)
 */
public class ConstructorEx {
	public static void main(String[] args) {
		MyClass c = new MyClass();
		
		System.out.println(c.getNum());
		System.out.println(c.getName());
		
		MyClass c1 = new MyClass();
		System.out.println(c1.getNum());
		System.out.println(c1.getName());
		//생성자를 통해 초기값이 지정되어있기때문에 같은값 출력
		
		MyClass c2 = new MyClass(10); //또 다른 생성자를 통해 값을 입력받을 수 있도록 만들어짐
		System.out.println(c2.getNum());
		System.out.println(c2.getName());

		MyClass c3 = new MyClass(20, "burgerking");
		System.out.println(c3.getNum());
		System.out.println(c3.getName());
	}
}
