package referenceType;

public class MyClass {
	private int num; //private로 정의된 field, method(두개합해 member)는 Class밖에서는 접근불가
	private String name;
	
	private static String staticVar;
	
	public MyClass() { //public으로 선언된 member는 Class밖에서 사용가능
		this.num = 5;
		this.name = "Samdasu"; //name과 num에 초기값이 지정
	}
	//생성자는 클래스명과 동일하게 생성 소괄호안에 파라미터를 받을 수 있게, 중괄호 안에 실행될 코드
	//주로 필드를 초기화 시키는데 사용
	
	public MyClass(int num) {
		//this();  먼저 생성된 생성자의 값을 가져옴
		this.num = num;
		this.name = "Samdasu";
	}//값을 입력받을 수 있도록 만들어진 생성자
	
	public MyClass(int num, String name) {
		this.num = num;
		this.name = name;
	}
	
	/* method 정의 방법
	 * 접근지정자 리턴타입 메소드명(파라미터타입과 이름,) {
	 *    ......중괄호 안에 실행될 코드들
	 *    return 리턴타입에 맞는 값;//만약 void이면 생략가능.
	 * }
	 */
	public void setNum(int num) {
		this.num = num;
	}
	
	public int getNum() {
		return this.num;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getName() {
		
//		System.out.println(staticVar);
		return this.name;
	}
	
	//static method안에서 다른 field나 instance를 접근할 수 없다. static에서 static은 참조가능
	public static String getClassName() {
//		System.out.println(staticVar);
		
		return "이 클래스는 MyClass이다.";
	}
	
}
