/**
 * Скрытое поле-ловушка для ботов. Настоящие пользователи его не видят и не
 * заполняют; если поле пришло непустым — запрос отклоняется на сервере.
 * Не используем display:none (часть ботов его пропускает) — уводим за экран.
 */
export default function Honeypot() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      <label>
        Не заполняйте это поле
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}
