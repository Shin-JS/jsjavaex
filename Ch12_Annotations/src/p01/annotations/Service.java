package p01.annotations;
/**[어노테이션]
 * -.annotation의 적용
 * -.RUNTIME시 특정기능 자동실행
 **/
public class Service {
	//어노테이션에 매개값이 없으면 default인 "-"가 15회 출력
	@PrintAnnotation 
	public void method1() {
		System.out.println("실행내용");
	}
	//어노테이션에 매개값이 하나 표시되어있으면 해당값("-")이 바뀐값("*")으로 15회 출력
	@PrintAnnotation("*")
	public void method2() {
		System.out.println("실행내용");
	}
	//value = "#" 바뀌고, number = 20 만큼 출력
	@PrintAnnotation(value="#",number=20)
	public void method3() {
		System.out.println("실행내용");
	}
	
}
