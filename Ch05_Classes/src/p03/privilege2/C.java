package p03.privilege2;

import p03.privilege.B; //다른 패키지에서 만든 라이브러리를 마치 현재의 패키지에 만든것처럼 사용가능

/** [접근제한자]
 * 
 **/
public class C{
//	A a; //default 클래스: 다른패키지에서 접근불가
	B b; //public 클래스: 다른 패키지에서 접근가능
}
