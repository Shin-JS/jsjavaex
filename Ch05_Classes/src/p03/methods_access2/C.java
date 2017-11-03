package p03.methods_access2;

import p03.methods_access1.A;

public class C {
	public C() {
		A a = new A(); //다른 패키지이므로 import
		a.field1 = 1; //필드가 public 이므로 다른 패키지에서 접근가능
//		a.field2 = 1; //필드가 default이므로 다른 패키지에서 접근 불가능
//		a.field3 = 1; //필드가 private이므로 다른 패키지에서 접근 불가능
		
		a.method1(); //메소드가 public이므로 다른 패키지에서 접근 가능
//		a.method2(); //메소드가 default이므로 다른 패키지에서 접근 불가능
//		a.method3(); //메소드가 private이므로 다른 패키지에서 접근 불가능
	}
}
