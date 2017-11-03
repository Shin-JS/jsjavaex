package p03.constructor_access2;

import p03.constructor_access1.A;

public class C {
	//필드
	A a1 = new A(true); //다른 패키지에 있어서 import시켜줘야 하나보다..... public이므로 다른 패키지내에서 접근 가능
//	A a2 = new A(1); //default이므로 다른 패키지내에서 접근 불가
//	A a3 = new A("홍길동"); //private이므로 당연히 접근 불가
}
