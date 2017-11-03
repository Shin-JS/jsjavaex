package p03.methods;
/** [메소드(static)]
 *  -.정적메소드: 클래스가 클래스로더에의해 메모리에 적재될 때, 클래스내용을 파악하여 static키워드가 있는 필드나 메소드는 따로 떼어서 static(정적)영역으로 로드함
 *  -.인스턴스 필드, 메소드는 클래스내에 그대로 둠
 *  ∴ static멤버는 클래스.멤버로 호출
 *    instance멤버는 객체를 생성후에 접근가능
 *  
 **/
public class Calculator4 {
	String color;  //인스턴스 필드
	void setColor(String color) { //인스턴스 메소드
		this.color=color;
	}
	static int plus(int x, int y) {  //정적 메소드
		return x+y;
	}
	static int minus(int x, int y) { //정적 메소드
		return x-y;
	}
}
