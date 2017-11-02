package p01.classes;
/**
 * 계산기( 피연산자 2개, 연산자(연산기호)) 
 **/
public class Calculator {
	//속성
	private int field1; // 1번연산자, 초기값 0
	private int field2; // 2번연산자, 초기값 0
	private char op; // 연산자(연산기호), 초기값 ' ';
	
	//메소드
	public void setField1(int field1) {
		this.field1 = field1;
	}
	public void setField2(int field2) {
		this.field2 = field2;
	}
	public void setOp(char op) {
		this.op = op;
	}
	
	public void calc() { //동일한 이름의 method 재정의.......
		switch(op) {
		case '+':
			System.out.println(field1+field2);
			break;
		case '-':
			System.out.println(field1-field2);
			break;
		case 'x':
			System.out.println(field1*field2);
			break;
		case '/':
			System.out.println(field1/field2);
			break;
		}
	}
	//int, int, char순으로 데이터를 받음
	public void calc(int field1, int field2, char op) {
		switch(op) {
		case '+':
			System.out.println(field1+field2);
			break;
		case '-':
			System.out.println(field1-field2);
			break;
		case 'x':
			System.out.println(field1*field2);
			break;
		case '/':
			System.out.println(field1/field2);
			break;
		}
	}
}
