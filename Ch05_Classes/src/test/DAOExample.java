package test;
/**
 * 문제 아래와 같이 출력되게 인터페이스와 클래스를 수정하세요.
 * */
public class DAOExample {
	public static void dbWork(DataAccessObject dao) {
		dao.select();
		dao.insert();
		dao.update();
		dao.delete();
	}
	public static void main(String[] args) {
		dbWork(new OracleDao());
		dbWork(new MySqlDao());
	}
}
//실행결과
/* Oracle DB에서 검색
 * Oracle DB에 삽입
 * Oracle DB를 수정
 * Oracle DB에서 삭제
 * Mysql DB에서 검색
 * Mysql DB에 삽입
 * Mysql DB를 수정
 * Mysql DB에서 삭제
 * */